from django.test import TestCase
from media.models import MediaItem, Note

class MediaItemTestCase(TestCase):
    def test_media_item_creation(self):
        """Test that we can create a media item"""
        media_item = MediaItem.objects.create(
            title="Test Photo",
            media_type="photo"
        )
        self.assertEqual(media_item.title, "Test Photo")
        self.assertEqual(media_item.media_type, "photo")

class NoteTestCase(TestCase):
    def test_note_creation(self):
        """Test that we can create a note"""
        note = Note.objects.create(
            content="This is a test note"
        )
        self.assertEqual(note.content, "This is a test note")
