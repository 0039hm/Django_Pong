from django.db import models
from django.contrib.auth import base_user
from django.contrib.auth.models import PermissionsMixin

class UserManager(base_user.BaseUserManager):
    def create_user(self, name, password, **extra_fields):
        user = self.model(
            name = name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self.db)
        return user

    def create_superuser(self, name, password, **extra_fields):
        user = self.model(
            name = name,
            **extra_fields
        )
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self.db)
        return user

    def __str__(self) -> str:
        return 'ユーザーマネージャ'

class User(base_user.AbstractBaseUser,PermissionsMixin):
    name = models.CharField(
        verbose_name='ユーザーネーム',
        unique=True,
        max_length=30
    )
    
    is_staff = models.BooleanField(
        verbose_name='管理者権限',
        default=False
    )
    is_superuser = models.BooleanField(
        verbose_name='スーパーユーザ',
        default=False
    )
    
    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    def __str__(self) -> str:
        return self.name
    
