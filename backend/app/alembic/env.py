from app.db.base import Base
from app.core.config import settings
from sqlalchemy import engine_from_config, pool
from alembic import context

# import models so Base has them
from app.models import user, preference, restaurant, review, favorite  # noqa

config = context.config
config.set_main_option("sqlalchemy.url", settings.sqlalchemy_database_uri)

target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()