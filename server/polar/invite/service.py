import random
import string
from typing import Sequence
from polar.config import settings
from polar.kit.extensions.sqlalchemy import sql
from sqlalchemy import desc
from sqlalchemy.orm import joinedload

from polar.models.invites import Invite
from polar.models.user import User
from polar.notifications.sender import get_email_sender
from polar.postgres import AsyncSession


class InviteService:
    async def list(self, session: AsyncSession) -> Sequence[Invite]:
        stmt = (
            sql.select(Invite)
            .options(joinedload(Invite.claimed_by_user))
            .order_by(desc(Invite.created_at))
            .limit(100)
        )
        res = await session.execute(stmt)
        return res.scalars().unique().all()

    async def create_code(self, session: AsyncSession, by_user: User) -> Invite:
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

        # TODO: try again if duplicate?

        res = await Invite.create(
            session=session,
            created_by=by_user.id,
            code=code,
        )

        return res

    async def send_invite(
        self, session: AsyncSession, invite: Invite, by_user: User, send_to_email: str
    ):
        invite.sent_to_email = send_to_email
        await invite.save(session, autocommit=True)

        sender = get_email_sender()
        sender.send_to_user(
            to_email_addr=send_to_email,
            subject="You're invited to Polar!",
            html_content=f"""Hi,<br><br>
{by_user.username} has invited you to <a href="https://polar.sh">Polar</a>.<br><br>
Your invite code is <strong>{invite.code}</strong>.<br><br>
Welcome!
            """,
        )

    async def claim_code(self, session: AsyncSession, user: User, code: str) -> bool:
        if settings.is_development() and code == "POLAR":
            return True

        invite = await Invite.find_by(
            session=session,
            code=code,
        )

        if not invite:
            return False

        # Already claimed by this user
        if invite.claimed_by == user.id:
            return True
        elif invite.claimed_by:
            return False  # Claimed by someone else

        invite.claimed_by = user.id
        await invite.save(session, autocommit=True)

        return True

    async def verify_and_claim_code(
        self, session: AsyncSession, user: User, code: str
    ) -> bool:
        if not self.claim_code(session, user, code):
            return False

        user.invite_only_approved = True
        await user.save(session, autocommit=True)

        return True


invite = InviteService()