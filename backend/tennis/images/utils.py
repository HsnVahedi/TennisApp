from PIL import Image as PILImage
from PIL import ImageDraw
from typing import Dict, List


def read_image(file_name: str) -> PILImage.Image:
    return PILImage.open(file_name)


def annotate_image(source_image: PILImage.Image, boxes: Dict[str, List[List[int]]]) -> PILImage.Image:
    annotated_image = source_image.copy()
    draw = ImageDraw.Draw(annotated_image)
    colors = {
        'ball': 'red',
        'player': 'blue',
        'racket': 'green',
        'net': 'yellow',
    }
    for obj_name, obj_boxes in boxes.items():
        for obj_box in obj_boxes:
            draw_box(draw, obj_box, colors[obj_name])
    return annotated_image

def draw_box(draw: ImageDraw.ImageDraw, box: List[int], color: str):
    """Draws a rectangle on the image for the given box coordinates."""
    draw.rectangle(box, outline=color, width=3)
