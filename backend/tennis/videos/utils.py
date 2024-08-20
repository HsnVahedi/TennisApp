import cv2
import os
import uuid

def get_random_path(video_path: str, start: int, end: int) -> str:
    video_file_name = os.path.basename(video_path)
    video_file_name = video_file_name.split('.')[0]
    return os.path.join(
        os.getcwd(),
        f'{video_file_name}{start}-{end}-{str(uuid.uuid4())}'
    )

def extract_frames(video_path: str, frames_dir_path: str, fps: float, start: int, end: int) -> None:
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
            cv2.imwrite(f"{frames_dir_path}/{current_frame}.jpg", frame)
        current_frame += 1
    cap.release()


def get_video_length(file_path) -> float:
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('file_path: ', file_path)
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    # Open the video file
    video = cv2.VideoCapture(file_path)
    
    # Get the total number of frames
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Get the frame rate
    fps = video.get(cv2.CAP_PROP_FPS)
    print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print('fps: ', fps)
    print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    
    # Calculate the duration in seconds
    duration = total_frames / fps
    
    # Release the video object
    video.release()
    
    return duration