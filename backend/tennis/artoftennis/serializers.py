from rest_framework import serializers

class DataSerializer(serializers.Serializer):
    data = serializers.IntegerField()
