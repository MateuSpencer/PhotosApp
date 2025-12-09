"""
Media processing utilities for EXIF extraction and thumbnail generation.
"""
import os
import io
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import exifread


def get_exif_data(file_path_or_bytes):
    """
    Extract EXIF data from an image file.
    
    Args:
        file_path_or_bytes: Either a file path string or file bytes
        
    Returns:
        dict: Dictionary containing extracted EXIF data
    """
    exif_data = {
        'capture_date': None,
        'latitude': None,
        'longitude': None,
        'camera_make': None,
        'camera_model': None,
        'orientation': None,
    }
    
    try:
        # Handle both file path and file object
        if isinstance(file_path_or_bytes, (str, bytes)):
            if isinstance(file_path_or_bytes, str):
                with open(file_path_or_bytes, 'rb') as f:
                    tags = exifread.process_file(f, details=False)
            else:
                tags = exifread.process_file(io.BytesIO(file_path_or_bytes), details=False)
        else:
            # File-like object
            file_path_or_bytes.seek(0)
            tags = exifread.process_file(file_path_or_bytes, details=False)
            file_path_or_bytes.seek(0)
        
        # Extract date/time
        date_tags = ['EXIF DateTimeOriginal', 'EXIF DateTimeDigitized', 'Image DateTime']
        for tag in date_tags:
            if tag in tags:
                date_str = str(tags[tag])
                try:
                    exif_data['capture_date'] = datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
                    break
                except ValueError:
                    continue
        
        # Extract GPS coordinates
        gps_lat = tags.get('GPS GPSLatitude')
        gps_lat_ref = tags.get('GPS GPSLatitudeRef')
        gps_lon = tags.get('GPS GPSLongitude')
        gps_lon_ref = tags.get('GPS GPSLongitudeRef')
        
        if gps_lat and gps_lon:
            exif_data['latitude'] = _convert_to_degrees(gps_lat)
            if gps_lat_ref and str(gps_lat_ref) == 'S':
                exif_data['latitude'] = -exif_data['latitude']
                
            exif_data['longitude'] = _convert_to_degrees(gps_lon)
            if gps_lon_ref and str(gps_lon_ref) == 'W':
                exif_data['longitude'] = -exif_data['longitude']
        
        # Extract camera info
        if 'Image Make' in tags:
            exif_data['camera_make'] = str(tags['Image Make'])
        if 'Image Model' in tags:
            exif_data['camera_model'] = str(tags['Image Model'])
        if 'Image Orientation' in tags:
            exif_data['orientation'] = int(str(tags['Image Orientation']))
            
    except Exception as e:
        print(f"Error extracting EXIF data: {e}")
    
    return exif_data


def _convert_to_degrees(value):
    """
    Convert GPS coordinates from EXIF format to decimal degrees.
    """
    try:
        d = float(value.values[0].num) / float(value.values[0].den)
        m = float(value.values[1].num) / float(value.values[1].den)
        s = float(value.values[2].num) / float(value.values[2].den)
        return d + (m / 60.0) + (s / 3600.0)
    except (AttributeError, IndexError, ZeroDivisionError):
        return None


def generate_thumbnails(image_path, output_dir, base_name):
    """
    Generate multiple thumbnail sizes for an image.
    
    Args:
        image_path: Path to the original image
        output_dir: Directory to save thumbnails
        base_name: Base name for thumbnail files
        
    Returns:
        dict: Dictionary with paths to generated thumbnails
    """
    THUMBNAIL_SIZES = {
        'small': (150, 150),
        'medium': (400, 400),
        'large': (800, 800),
    }
    
    thumbnails = {}
    
    try:
        os.makedirs(output_dir, exist_ok=True)
        
        with Image.open(image_path) as img:
            # Handle EXIF orientation
            img = _fix_orientation(img)
            
            # Convert to RGB if necessary (for PNG with alpha, etc.)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            for size_name, dimensions in THUMBNAIL_SIZES.items():
                thumb = img.copy()
                thumb.thumbnail(dimensions, Image.Resampling.LANCZOS)
                
                thumb_filename = f"{base_name}_{size_name}.jpg"
                thumb_path = os.path.join(output_dir, thumb_filename)
                
                thumb.save(thumb_path, 'JPEG', quality=85, optimize=True)
                thumbnails[size_name] = thumb_path
                
    except Exception as e:
        print(f"Error generating thumbnails: {e}")
    
    return thumbnails


def _fix_orientation(img):
    """
    Fix image orientation based on EXIF data.
    """
    try:
        exif = img._getexif()
        if exif:
            for tag, value in exif.items():
                if TAGS.get(tag) == 'Orientation':
                    if value == 2:
                        img = img.transpose(Image.FLIP_LEFT_RIGHT)
                    elif value == 3:
                        img = img.rotate(180)
                    elif value == 4:
                        img = img.transpose(Image.FLIP_TOP_BOTTOM)
                    elif value == 5:
                        img = img.rotate(-90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                    elif value == 6:
                        img = img.rotate(-90, expand=True)
                    elif value == 7:
                        img = img.rotate(90, expand=True).transpose(Image.FLIP_LEFT_RIGHT)
                    elif value == 8:
                        img = img.rotate(90, expand=True)
                    break
    except (AttributeError, KeyError, IndexError):
        pass
    
    return img


def get_media_type(filename):
    """
    Determine media type based on file extension.
    
    Args:
        filename: Name of the file
        
    Returns:
        str: 'photo' or 'video'
    """
    photo_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif'}
    video_extensions = {'.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'}
    
    ext = os.path.splitext(filename.lower())[1]
    
    if ext in photo_extensions:
        return 'photo'
    elif ext in video_extensions:
        return 'video'
    else:
        return 'photo'  # Default to photo


def process_uploaded_media(file_obj, save_path):
    """
    Process an uploaded media file: extract EXIF data and generate thumbnails.
    
    Args:
        file_obj: The uploaded file object
        save_path: Path where the file is saved
        
    Returns:
        dict: Processing results including EXIF data and thumbnail paths
    """
    result = {
        'exif': {},
        'thumbnails': {},
        'media_type': get_media_type(file_obj.name),
    }
    
    if result['media_type'] == 'photo':
        # Extract EXIF data
        file_obj.seek(0)
        result['exif'] = get_exif_data(file_obj)
        
        # Generate thumbnails
        base_dir = os.path.dirname(save_path)
        thumb_dir = os.path.join(base_dir, 'thumbnails')
        base_name = os.path.splitext(os.path.basename(save_path))[0]
        
        result['thumbnails'] = generate_thumbnails(save_path, thumb_dir, base_name)
    
    return result
