# Generated by Django 5.1.5 on 2025-02-03 02:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sorteo_app", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="listanegra",
            name="participante",
        ),
        migrations.AddField(
            model_name="listanegra",
            name="apellido",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="area",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="cargo",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="dominio",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="email",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="localidad",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="nombre",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AddField(
            model_name="listanegra",
            name="provincia",
            field=models.CharField(blank=True, default="-", max_length=255),
        ),
        migrations.AlterField(
            model_name="listanegra",
            name="id",
            field=models.IntegerField(primary_key=True, serialize=False),
        ),
    ]
