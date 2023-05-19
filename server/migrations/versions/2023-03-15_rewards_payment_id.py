"""rewards payment id

Revision ID: 1b7b6c7d73d2
Revises: 75d831301aab
Create Date: 2023-03-15 11:14:34.708444

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "1b7b6c7d73d2"
down_revision = "75d831301aab"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("rewards", sa.Column("payment_id", sa.String(), nullable=True))
    op.create_index(
        op.f("ix_rewards_payment_id"), "rewards", ["payment_id"], unique=False
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_rewards_payment_id"), table_name="rewards")
    op.drop_column("rewards", "payment_id")
    # ### end Alembic commands ###
