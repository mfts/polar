"""reference_idx

Revision ID: d1bdd6e1e8a9
Revises: bd951c7c4d8f
Create Date: 2023-04-28 10:58:05.715117

"""
from alembic import op


# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "d1bdd6e1e8a9"
down_revision = "bd951c7c4d8f"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index(
        op.f("ix_issue_references_issue_id"),
        "issue_references",
        ["issue_id"],
        unique=False,
    )
    op.create_index(op.f("ix_pledges_issue_id"), "pledges", ["issue_id"], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_pledges_issue_id"), table_name="pledges")
    op.drop_index(op.f("ix_issue_references_issue_id"), table_name="issue_references")
    # ### end Alembic commands ###
