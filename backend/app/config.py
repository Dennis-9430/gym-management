from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "gym_management"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    app_name: str = "Gym Management API"
    debug: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
