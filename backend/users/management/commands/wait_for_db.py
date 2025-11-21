import time

from django.core.management import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Pause execution until the default database is available."

    def handle(self, *args, **options):
        self.stdout.write("Waiting for database...")
        attempts = 0
        while True:
            try:
                connection = connections["default"]
                connection.cursor()
                break
            except OperationalError:
                attempts += 1
                self.stdout.write(
                    f"Database unavailable, waiting 1 second... (attempt {attempts})"
                )
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS("Database available!"))
