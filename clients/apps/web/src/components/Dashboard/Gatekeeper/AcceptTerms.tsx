import { useAuth } from 'hooks'
import Link from 'next/link'
import {
  Checkbox,
  PrimaryButton,
  RedBanner,
  ShadowBox,
} from 'polarkit/components/ui'
import { useUserAcceptTermsOfService } from 'polarkit/hooks'
import { ChangeEvent, useState } from 'react'
import TakeoverBox from './TakeoverBox'
import TakeoverHeader from './TakeoverHeader'

const AcceptTerms = () => {
  const [loading, setLoading] = useState(false)
  const acceptTerms = useUserAcceptTermsOfService()
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  const { reloadUser } = useAuth()

  const onContinueClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setLoading(true)
    setShowErrorBanner(false)

    acceptTerms
      .mutateAsync()
      .then((res) => {
        if (!res || !res.accepted_terms_of_service) {
          throw new Error('something went wrong')
        }
      })
      .then(reloadUser)
      .catch(() => {
        setShowErrorBanner(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const [approvedTos, setApprovedTos] = useState(false)
  const onChangeAcceptTos = (e: ChangeEvent<HTMLInputElement>) => {
    setApprovedTos(e.target.checked)
  }

  return (
    <TakeoverBox>
      <>
        <TakeoverHeader>
          <>Terms of Service and Privacy Policy</>
        </TakeoverHeader>

        {showErrorBanner && (
          <RedBanner>
            <>Something went wrong, please try again.</>
          </RedBanner>
        )}

        <ShadowBox>
          <div className="flex flex-col space-y-2">
            <p className="text-gray-500">
              To join Polar you must accept the Terms of Service and the Privacy
              Policy
            </p>
            <Checkbox
              id="accept_tos"
              value={approvedTos}
              onChange={onChangeAcceptTos}
            >
              I accept the{' '}
              <Link href="/tos" className="underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </Checkbox>

            <PrimaryButton
              disabled={!approvedTos}
              loading={loading}
              onClick={onContinueClick}
            >
              Continue
            </PrimaryButton>
          </div>
        </ShadowBox>
      </>
    </TakeoverBox>
  )
}

export default AcceptTerms