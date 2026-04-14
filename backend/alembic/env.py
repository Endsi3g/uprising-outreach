import asyncio
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings
from app.database import Base

# Import all models so Alembic can detect them
import app.auth.models  # noqa: F401
import app.workspaces.models  # noqa: F401
import app.leads.models  # noqa: F401
import app.companies.models  # noqa: F401
import app.contacts.models  # noqa: F401
import app.senders.models  # noqa: F401

config = context.config
fileConfig(config.config_file_name)  # type: ignore[arg-type]
target_metadata = Base.metadata

# Allow DATABASE_URL override via environment (e.g., in CI)
db_url = os.environ.get("DATABASE_URL", settings.database_url)


def run_migrations_offline() -> None:
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):  # type: ignore[no-untyped-def]
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = create_async_engine(db_url)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
