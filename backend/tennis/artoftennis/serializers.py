from rest_framework import serializers

class DataSerializer(serializers.Serializer):
    data = serializers.IntegerField()


class UserInfoSerializer(serializers.Serializer):
    username = serializers.CharField()