import React from 'react'
import { createRoot } from 'react-dom/client'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { isAuthenticated } from './api'
import AuthorizationBanner from './components/AuthorizationBanner'
import CachedIssueListItemDecoration from './components/CachedIssueListItemDecoration'
import reportWebVitals from './reportWebVitals'

const [, orgName, repoName] = window.location.pathname.split('/')

const findIssueNodes = (node: Element | Document) =>
  node.querySelectorAll("div[id^='issue_']:has(a[id^='issue_'])")

const getIssueNumbers = (issues: NodeListOf<Element>) => {
  const issueNumbers: string[] = []
  issues.forEach((issue) => {
    issueNumbers.push(issue.id.replace('issue_', ''))
  })
  return issueNumbers
}

const requestDecoration = (issueNumbers: string[]) => {
  return chrome.runtime.sendMessage({
    type: 'decorate-issues',
    orgName,
    repoName,
    issueNumbers,
  })
}

const mountDecoration = (issues: NodeListOf<Element>) => {
  issues.forEach((issue) => {
    const issueNumber = parseInt(issue.id.replace('issue_', ''))
    const id = `polar-extension-issue-${issueNumber}`

    // Delete previous (stale!) versions of this embed
    // This happens when navigating back/forward github SPA
    const existing = document.getElementById(id)
    if (existing) {
      existing.remove()
    }

    const embed = document.createElement('div')
    embed.classList.add('polar-extension-decoration-root')
    embed.id = id
    embed.style.display = 'flex'
    issue.insertAdjacentElement('afterend', embed)
    const root = createRoot(embed)
    root.render(
      <React.StrictMode>
        <CachedIssueListItemDecoration
          orgName={orgName}
          repoName={repoName}
          number={issueNumber}
        />
      </React.StrictMode>,
    )
  })
}

const mountAuthorizationBanner = () => {
  const heading = document.querySelector(
    'div.new-discussion-timeline h1.sr-only',
  )
  if (heading) {
    const badge = document.createElement('div')
    badge.id = 'polar-authorize-banner'
    badge.style.height = '72px'

    heading.insertAdjacentElement('afterend', badge)
    const root = createRoot(badge)
    root.render(
      <React.StrictMode>
        <Frame
          head={[
            <link
              type="text/css"
              rel="stylesheet"
              href={chrome.runtime.getURL('frame.css')}
            ></link>,
          ]}
          style={{
            overflow: 'hidden',
            width: '100%',
            border: 'none',
            height: 72,
          }}
        >
          <FrameContextConsumer>
            {({ document, window }) => {
              return <AuthorizationBanner />
            }}
          </FrameContextConsumer>
        </Frame>
      </React.StrictMode>,
    )
  }
}

const decorateIssues = () => {
  // Decorate all issues on page
  const issues = findIssueNodes(document)
  if (issues.length > 0) {
    const issueNumbers = getIssueNumbers(issues)
    requestDecoration(issueNumbers)
    mountDecoration(issues)
  }

  // Listen for changes to the DOM, and decorate any new issues
  // We must listen at the root, since some requests (like pagination) replace the entire DOM
  const turboFrame = document.querySelector('html')
  if (turboFrame) {
    const callback = (mutationList: MutationRecord[], observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((addedNode) => {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              const element = addedNode as Element
              const issues = findIssueNodes(element)
              if (issues.length > 0) {
                const issueNumbers = getIssueNumbers(issues)
                requestDecoration(issueNumbers)
                mountDecoration(issues)
              }
            }
          })
        }
      }
    }
    const observer = new MutationObserver(callback)
    observer.observe(turboFrame, {
      childList: true,
      subtree: true,
    })
  }
}

const showAuthorizeBanner = () => {
  // Show an authorize banner
  mountAuthorizationBanner()

  // Remove the banner and start decorating issues if the user authorizes
  chrome.storage.local.onChanged.addListener(
    (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.token && changes.token.newValue) {
        const banner = document.getElementById('polar-authorize-banner')
        if (banner) {
          banner.remove()
        }
        decorateIssues()
      }
    },
  )
}

const main = async () => {
  if (await isAuthenticated()) {
    decorateIssues()
  } else {
    showAuthorizeBanner()
  }
}

let win = window as any

if (!win.__POLAR_IS_LOADED__) {
  win.__POLAR_IS_LOADED__ = true

  if (orgName && repoName) {
    main()
  }

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals()
}
