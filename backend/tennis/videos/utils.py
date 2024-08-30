import cv2
import os
import uuid
from storage.media import download_from_media, write_to_media
import shutil

def get_random_path(video_path: str, start: int, end: int) -> str:
    video_file_name = os.path.basename(video_path)
    video_file_name = video_file_name.split('.')[0]
    return os.path.join(
        os.getcwd(),
        f'{video_file_name}{start}-{end}-{str(uuid.uuid4())}'
    )

def extract_frames(video_name: str, frames_dir_path: str, fps: float, start: int, end: int) -> None:
    video_path = download_from_media(video_name)
    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    start_frame = int(start * video_fps)
    end_frame = int(end * video_fps)
    os.makedirs(frames_dir_path, exist_ok=True)
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
    current_frame = start_frame
    while current_frame < end_frame:
        ret, frame = cap.read()
        if not ret:
            break
        if current_frame % int(video_fps // fps) == 0:
            file_path = f"{frames_dir_path}/{current_frame}.jpg"
            cv2.imwrite(file_path, frame)
            media_url = write_to_media(
                file_path,
            )
            print('UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU')
            print('file_path:', file_path)
            print('media_url:', media_url)
            print('video_name:', video_name)
            print('video_path:', video_path)
            print('UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU')
            os.remove(file_path)
        current_frame += 1
    cap.release()
    shutil.rmtree(frames_dir_path)
    # os.remove(video_path)


def get_video_length(file_name) -> float:
    file_path = download_from_media(file_name)
    video = cv2.VideoCapture(file_path)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = video.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps
    video.release()
    return duration