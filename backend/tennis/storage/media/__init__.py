import os
from django.conf import settings
import io
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from typing import Union




def get_all_media_files(directory):
    media_file_paths = []

    # Walk through the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            # Construct the full file path
            file_path = os.path.join(root, file)
            
            # Relative path needed for Django storage
            relative_path = os.path.relpath(file_path, directory)
            print('RRRRRRRRRRRRRRR')
            print('relative_path:', relative_path)
            print('RRRRRRRRRRRRRRR')
            
            # Check if the file exists in the storage
            if default_storage.exists(relative_path):
                media_file_paths.append(relative_path)

    return media_file_paths



def write_video_to_media(local_path: str) -> str:
    media_path = f"media/{os.path.basename(local_path)}"
    with open(local_path, 'rb') as file:
        saved_name = default_storage.save(media_path, file)
    return saved_name 


def write_to_media(local_path: str, ignore_path_structure: bool = False) -> str:
    media_path = local_path
    if ignore_path_structure:
        media_path = os.path.basename(local_path)
    with open(local_path, 'rb') as file:
        default_storage.save(f"{media_path}", file)
    return default_storage.url(media_path)


def write_bytes_to_media(file_name: str, content: Union[bytes, io.BytesIO]) -> str:
    """
    Writes content to media storage, using Azure Blob Storage in production
    and the local file system in development.

    :param file_name: The name of the file to be saved (e.g., 'somefile.zip').
    :param content: The content to be written to the file, as bytes or a BytesIO object.
    :return: The URL to the saved file.
    """
    if isinstance(content, io.BytesIO):
        content = content.getvalue()
    if os.getenv('IS_PROD'):
        # In production, use Azure Blob Storage via default_storage
        file_content = ContentFile(content)
        saved_file_name = default_storage.save(f"{settings.MEDIA_LOCATION}/{file_name}", file_content)
        file_url = default_storage.url(saved_file_name)
    else:
        # In development, save to the local file system
        local_path = os.path.join(settings.MEDIA_ROOT, file_name)
        os.makedirs(
            os.path.dirname(local_path),
            exist_ok=True
        )
        with open(local_path, 'wb') as local_file:
            local_file.write(content)
        file_url = f"{settings.MEDIA_URL}{file_name}"
    return file_url


def list_all_files(dir_name: str) -> list:
        """
        Recursively lists all files in a directory in the media storage.
        
        :param directory_name: The root directory to start listing files from.
        :return: A list of all file paths within the directory and its subdirectories.
        """
        files = []
        directories, file_list = default_storage.listdir(dir_name)
        
        # Add files in the current directory
        for file_name in file_list:
            files.append(
                os.path.join(
                    dir_name, os.path.basename(file_name)
                )
            )
        
        
        # Recursively add files from subdirectories
        for subdirectory in directories:
            files.extend(
                list_all_files(
                    os.path.join(dir_name, subdirectory)
                )
            )
        # files = [os.path.basename(file) for file in files] 
        return files


def download_dir_from_media(directory_name: str) -> str:
    
    """
    Downloads a directory stored in Django media (Azure Blob Storage in production)
    into a temporary directory in the container's local file system and returns
    the local directory path.
    
    :param directory_name: The name of the directory to be downloaded (e.g., 'some_directory/').
    :return: The local directory path where the directory is saved.
    """

    # Ensure the directory path ends with a slash to differentiate it from files
    if not directory_name.endswith('/'):
        directory_name += '/'

    # Recursively list all files in the directory from media storage
    files = list_all_files(directory_name)

    # Check if the directory exists in media storage
    if not files:
        raise FileNotFoundError(f"Directory {directory_name} does not exist in Azure Blob Storage.")

    local_dir = None

    # Download each file in the directory using the download_from_media function
    for media_file_path in files:
        local_path = download_from_media(media_file_path)
        if not local_dir:
            local_dir = os.path.dirname(local_path)

    return local_dir


def download_from_media(file_name: str) -> str:
    """
    Downloads a file stored in Django media (Azure Blob Storage in production)
    into the container's local file system and returns the local file path.

    :param file_name: The name of the file to be downloaded (e.g., 'somefile.zip').
    :return: The local file path where the file is saved.
    """

    local_path = os.path.join("temp", file_name)
    # media_path = os.path.join(settings.MEDIA_ROOT, file_name) 
    media_path = file_name
    chunk_size = 1024 * 1024  # 1 MB chunks

    if not default_storage.exists(media_path):
        raise FileNotFoundError(f"File {media_path} does not exist in Azure Blob Storage.")
    with default_storage.open(media_path, 'rb') as file:
        os.makedirs(
            os.path.dirname(local_path),
            exist_ok=True
        )
        with open(local_path, 'wb') as local_file:
            # For big files, don't load the whole file into memory at once (use chunks)
            for chunk in iter(lambda: file.read(chunk_size), b''):
                local_file.write(chunk)
    return local_path


def read_from_media(file_name: str) -> bytes:
    """
    Reads content from media storage, using Azure Blob Storage in production
    and the local file system in development.

    :param file_name: The name of the file to be read (e.g., 'somefile.zip').
    :return: The content of the file as bytes or a BytesIO object, or None if the file does not exist.
    """
    file_path = download_from_media(file_name)
    with open(file_path, 'rb') as file:
        content = file.read()
    os.remove(file_path)
    return content
    # if os.getenv('IS_PROD'):
    #     # In production, use Azure Blob Storage via default_storage
    #     if default_storage.exists(file_name):
    #         with default_storage.open(file_name, 'rb') as file:
    #             return file.read()
    #     else:
    #         raise FileNotFoundError(file_name)
    # else:
    #     # In development, read from the local file system
    #     local_path = os.path.join(settings.MEDIA_ROOT, file_name)
    #     if os.path.exists(local_path):
    #         with open(local_path, 'rb') as file:
    #             return file.read()
    #     else:
    #         raise FileNotFoundError(file_name)




# def download_from_media(file_name: str) -> str:
#     """
#     Downloads a file stored in Django media (Azure Blob Storage in production)
#     into the container's local file system and returns the local file path.

#     :param file_name: The name of the file to be downloaded (e.g., 'somefile.zip').
#     :return: The local file path where the file is saved.
#     """
#     def write_chunks(media_path, local_path):
#         if not default_storage.exists(media_path):
#             raise FileNotFoundError(f"File {media_path} does not exist in Azure Blob Storage.")
#         with default_storage.open(media_path, 'rb') as file:
#             os.makedirs(
#                 os.path.dirname(local_path),
#                 exist_ok=True
#             )
#             with open(local_path, 'wb') as local_file:
#                 # For big files, don't load the whole file into memory at once (use chunks)
#                 for chunk in iter(lambda: file.read(chunk_size), b''):
#                     local_file.write(chunk)

#     local_path = os.path.join("temp", file_name)
#     media_path = os.path.join(settings.MEDIA_ROOT, file_name)
#     chunk_size = 1024 * 1024  # 1 MB chunks
#     if os.getenv('IS_PROD'):
#         write_chunks(media_path, local_path)
#         # In production, download from Azure Blob Storage to local file system in chunks
#         # if not default_storage.exists(file_name):
#         #     file_name = os.path.join(settings.MEDIA_ROOT, file_name)

#             # if default_storage.exists(file_name):
#             #     with default_storage.open(file_name, 'rb') as file:
#             #         os.makedirs(
#             #             os.path.dirname(local_path),
#             #             exist_ok=True
#             #         )
#             #         with open(local_path, 'wb') as local_file:
#             #             # For big files, don't load the whole file into memory at once (use chunks)
#             #             for chunk in iter(lambda: file.read(chunk_size), b''):
#             #                 local_file.write(chunk)
#             # else:
#             #     raise FileNotFoundError(f"File {file_name} does not exist in Azure Blob Storage.")
#     else:
#         write_chunks(media_path, local_path)
#         # if not default_storage.exists(media_path):
#         #     raise FileNotFoundError(f"File {media_path} does not exist in local media storage.")
    
#     return local_path
