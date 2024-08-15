from celery import shared_task
from ml.jobs.obj_detection.ball import invoke as invoke_ball_detection
from ml.jobs.obj_detection.objs import invoke as invoke_objs_detection
from ml.jobs.obj_detection.results import Result as ObjDetectionResult
from ml.jobs.obj_detection.results import get_results as get_obj_detection_results
from ml.jobs.status import check_status, COMPLETED, FAILED, CANCELLED
# from images.utils import annotate_images
import time
import re
import shutil


@shared_task
def save_obj_detection_results_task(batch_pk: int, ball_job_id: str, objs_job_id: str) -> None:
    from videos.models import FramesBatch
    ball_result = get_obj_detection_results(ball_job_id)
    objs_result = get_obj_detection_results(objs_job_id)
    frames_batch = FramesBatch.objects.get(pk=batch_pk)
    def extract_file_number(file_path: str) -> int:
        pattern = r'/score/(\d+)\.json$'
        match = re.search(pattern, file_path)
        if match:
            return int(match.group(1))
        else:
            raise ValueError("Invalid file path format")

    # Each key is of shape: f"./predictions-batchjob-{batch_id}/azureml/{az_ml_job_id}/score/{file_number}.json"
    # Let's create a new dictionary where the keys are the file numbers
    ball_result = {
        extract_file_number(k): v
        for k, v in ball_result.items()
    }
    objs_result = {
        extract_file_number(k): v
        for k, v in objs_result.items()
    }


    # Now, ball_result.keys() and objs_result.keys() are exactly the same
    frames = objs_result.keys()
    result: ObjDetectionResult = {}
    for frame in frames:
        objs = objs_result[frame]
        ball = ball_result[frame]
        result[frame] = {}
        for obj_name in objs:
            result[frame][obj_name] = objs[obj_name]
        for obj_name in ball:
            result[frame][obj_name] = ball[obj_name]

    frames_batch.on_detection_completed(result)
    



@shared_task
def wait_for_objects_detection_task(batch_pk: int, ball_job_id: str, objs_job_id: str) -> None:
    ball_job_status = check_status(ball_job_id)
    objs_job_status = check_status(objs_job_id)
    ball_finished = ball_job_status in [COMPLETED, FAILED, CANCELLED]
    objs_finished = objs_job_status in [COMPLETED, FAILED, CANCELLED]
    if ball_finished and objs_finished:
        save_obj_detection_results_task.delay(batch_pk, ball_job_id, objs_job_id)
    else:
        print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
        print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
        print('Waiting for the jobs to finish...')
        from videos.models import FramesBatch
        print(f'batch directory: {FramesBatch.objects.get(pk=batch_pk).dir_path}')
        print(f'ball_job_status: {ball_job_status}')
        print(f'objs_job_status: {objs_job_status}')
        print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
        print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW')
        time.sleep(7 * 60)
        wait_for_objects_detection_task.delay(batch_pk ,ball_job_id, objs_job_id)


@shared_task
def tennis_object_detection_task(images_dir_path: str) -> ObjDetectionResult:
    from videos.models import FramesBatch
    frames_batch = FramesBatch.objects.get(dir_path=images_dir_path)
    objs_job_id = invoke_objs_detection(images_dir_path)
    ball_job_id = invoke_ball_detection(images_dir_path)
    wait_for_objects_detection_task.delay(frames_batch.pk, ball_job_id, objs_job_id)


# @shared_task
# def image_annotation_task(images_dir_path: str, detections: ObjDetectionResult) -> None:
#     annotate_images(images_dir_path ,detections)


