from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
import os


class Command(BaseCommand):
    help = 'Create a superuser for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username for the superuser (default: admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@photosapp.dev',
            help='Email for the superuser (default: admin@photosapp.dev)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the superuser (default: admin123)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force creation even if user already exists'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        force = options['force']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            if force:
                self.stdout.write(
                    self.style.WARNING(f'User {username} already exists. Deleting and recreating...')
                )
                User.objects.filter(username=username).delete()
            else:
                self.stdout.write(
                    self.style.WARNING(f'User {username} already exists. Use --force to recreate.')
                )
                return

        try:
            with transaction.atomic():
                # Create superuser
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                
                # The Profile will be created automatically via signals
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created superuser: {username}\n'
                        f'Email: {email}\n'
                        f'Password: {password}\n'
                        f'Profile created automatically via signals.'
                    )
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )
