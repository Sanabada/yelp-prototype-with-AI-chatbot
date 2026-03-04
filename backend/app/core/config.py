from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Yelp Prototype API"
    ENV: str = "dev"

    MYSQL_HOST: str
    MYSQL_PORT: int = 3306
    MYSQL_DB: str
    MYSQL_USER: str
    MYSQL_PASSWORD: str

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    UPLOAD_DIR: str = "uploads"

    @property
    def sqlalchemy_database_uri(self) -> str:
        # SQLAlchemy + PyMySQL
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()