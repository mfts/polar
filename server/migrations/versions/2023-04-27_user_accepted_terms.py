"""user_accepted_terms

Revision ID: bd951c7c4d8f
Revises: 925c9f34054d
Create Date: 2023-04-27 09:52:57.112040

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "bd951c7c4d8f"
down_revision = "925c9f34054d"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "users",
        sa.Column(
            "accepted_terms_of_service",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("users", "accepted_terms_of_service")
    # ### end Alembic commands ###
