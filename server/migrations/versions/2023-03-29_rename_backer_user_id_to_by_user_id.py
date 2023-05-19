"""rename backer_user_id to by_user_id

Revision ID: 04b3cb443b5a
Revises: f8589f130a0f
Create Date: 2023-03-29 10:28:55.672022

"""
from alembic import op
import sqlalchemy as sa


# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "04b3cb443b5a"
down_revision = "f8589f130a0f"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("pledges", sa.Column("by_user_id", sa.UUID(), nullable=True))
    op.drop_index("ix_pledges_backer_user_id", table_name="pledges")
    op.create_index(
        op.f("ix_pledges_by_user_id"),
        "pledges",
        ["by_user_id"],
        unique=False,
    )
    op.drop_constraint("pledges_backer_user_id_fkey", "pledges", type_="foreignkey")
    op.create_foreign_key(
        op.f("pledges_by_user_id_fkey"),
        "pledges",
        "users",
        ["by_user_id"],
        ["id"],
    )
    op.drop_column("pledges", "backer_user_id")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "pledges",
        sa.Column("backer_user_id", sa.UUID(), autoincrement=False, nullable=True),
    )
    op.drop_constraint(op.f("pledges_by_user_id_fkey"), "pledges", type_="foreignkey")
    op.create_foreign_key(
        "pledges_backer_user_id_fkey",
        "pledges",
        "users",
        ["backer_user_id"],
        ["id"],
    )
    op.drop_index(op.f("ix_pledges_by_user_id"), table_name="pledges")
    op.create_index(
        "ix_pledges_backer_user_id",
        "pledges",
        ["backer_user_id"],
        unique=False,
    )
    op.drop_column("pledges", "by_user_id")
    # ### end Alembic commands ###
