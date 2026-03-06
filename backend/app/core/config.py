from urllib.parse import quote_plus

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
        user = quote_plus(self.MYSQL_USER)
        password = quote_plus(self.MYSQL_PASSWORD)  # ✅ encodes @ as %40, etc.
        db = quote_plus(self.MYSQL_DB)

        return (
            f"mysql+pymysql://{user}:{password}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{db}"
        )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()