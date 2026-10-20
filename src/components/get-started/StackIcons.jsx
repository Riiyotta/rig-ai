// "Works with your stack" icons - verbatim from recon/svg/stack-*.svg (HTML L3090-3324).
// Inline fills (#000000 etc.) are as in the original; `.stack-item svg { fill: var(--paper) }`
// in get-started.css overrides the presentation attribute, exactly like the live site.

export function CodexIcon() {
  return (
    <svg aria-hidden="true" id="open-ai" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M22,8V7H21V6H19V4H18V3H17V2H16V1H11V2H10V3H9V2H6V3H4V4H3V6H2v5H1v5H2v1H3v1H5v2H6v1H7v1H8v1h5V22h1V21h1v1h3V21h2V20h1V18h1V13h1V8ZM9,6h1V4h1V3h5V4h1V5H12V6H11V7H10V9H9v2H8V8H9ZM5,17V16H4V15H3V11H4v2H5v2h8v1H12v1Zm10,1H14v2H13v1H8V20H7V19h5V18h1V17h1V15h1V13h1v3H15Zm5,0H19v1H18v1H16V18h1V16h1V14H17V12H16V11H15v1H14v2H10V13H9v1H7V13H6V12H5V10H4V6H5V5H6V4H8V6H7V8H6v2H7v2H8v1H9V12h1V10h4v1h1V10h2v1h1v1h1v2h1Zm1-5H20V11H19V9H11V8h1V7h7V8h1V9h1Z"></path>
    </svg>
  )
}

export function ClaudeCodeIcon() {
  return (
    <svg aria-hidden="true" id="anthropic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M16,17V15H15V12H14V10H13V8H12V6H11V4H7V6H6V8H5v2H4v2H3v3H2v2H1v2H4V17H5V15h8v2h1v2h3V17Zm-5-5H7V10H8V8h2v2h1Z"></path>
      <polygon points="23 17 23 19 20 19 20 17 19 17 19 15 18 15 18 13 17 13 17 10 16 10 16 8 15 8 15 6 14 6 14 4 17 4 17 6 18 6 18 8 19 8 19 10 20 10 20 13 21 13 21 15 22 15 22 17 23 17"></polygon>
    </svg>
  )
}

export function OpenCodeIcon() {
  return (
    <svg aria-hidden="true" width="240" height="300" viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1401_86283)">
        <mask
          id="mask0_1401_86283"
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="240"
          height="300"
        >
          <path d="M240 0H0V300H240V0Z" fill="var(--paper)"></path>
        </mask>
        <g mask="url(#mask0_1401_86283)">
          <path d="M180 240H60V120H180V240Z" fill="#4B4646"></path>
          <path d="M180 60H60V240H180V60ZM240 300H0V0H240V300Z" fill="#F1ECEC"></path>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_1401_86283">
          <rect width="240" height="300" fill="white"></rect>
        </clipPath>
      </defs>
    </svg>
  )
}

export function VsCodeIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
      <path
        fillRule="evenodd"
        d="M17 1H19V2H21V3H23V21H21V22H19V23H17V22H16V21H15V20H14V19H13V18H12V17H11V16H10V15H9V14H7V15H6V16H5V17H3V16H1V8H3V7H5V8H6V9H7V10H9V9H10V8H11V7H12V6H13V5H14V4H15V3H16V2H17ZM17 6H16V7H15V8H14V9H13V10H12V11H11V13H12V14H13V15H14V16H15V17H16V18H17ZM3 10H4V11H5V13H4V14H3Z"
      ></path>
    </svg>
  )
}

export function TerminalIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
      <path fillRule="evenodd" d="M2 3H22V4H23V20H22V21H2V20H1V4H2ZM3 7V19H21V7ZM3 4H5V5H3ZM7 4H9V5H7Z"></path>
      <path d="M5 9H7V10H8V11H9V12H10V14H9V15H8V16H7V17H5V15H6V14H7V12H6V11H5ZM12 15H18V17H12Z"></path>
    </svg>
  )
}

export function PythonIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
      <path
        fillRule="evenodd"
        d="M10 1H14V2H16V3H17V9H16V10H15V11H10V12H8V13H7V14H6V17H4V16H2V15H1V9H2V8H3V7H12V6H7V3H8V2H10ZM9 3H11V5H9Z"
      ></path>
      <path
        fillRule="evenodd"
        transform="rotate(180 12 12)"
        d="M10 1H14V2H16V3H17V9H16V10H15V11H10V12H8V13H7V14H6V17H4V16H2V15H1V9H2V8H3V7H12V6H7V3H8V2H10ZM9 3H11V5H9Z"
      ></path>
    </svg>
  )
}

export function JavaScriptIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
      <path
        fillRule="evenodd"
        d="M2 1H22V2H23V22H22V23H2V22H1V2H2ZM11 11H13V19H12V20H11V21H9V20H8V19H7V17H9V18H10V19H11ZM16 11H20V12H21V14H19V13H17V15H20V16H21V20H20V21H16V20H15V18H17V19H19V17H16V16H15V12H16Z"
      ></path>
    </svg>
  )
}

export function RustIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
      <path
        fillRule="evenodd"
        d="M10 1H14V3H16V2H18V4H20V6H22V8H21V10H23V14H21V16H22V18H20V20H18V22H16V21H14V23H10V21H8V22H6V20H4V18H2V16H3V14H1V10H3V8H2V6H4V4H6V2H8V3H10ZM9 5H15V6H17V7H18V9H19V15H18V17H17V18H15V19H9V18H7V17H6V15H5V9H6V7H7V6H9Z"
      ></path>
      <path
        fillRule="evenodd"
        d="M7 7H14V8H16V9H17V11H16V12H14V13H15V14H16V15H17V17H14V16H13V14H12V13H10V15H11V17H7V15H8V9H7ZM10 9V11H14V9Z"
      ></path>
    </svg>
  )
}

export function GitHubIcon() {
  return (
    <svg aria-hidden="true" id="github" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <polygon points="23 9 23 15 22 15 22 17 21 17 21 19 20 19 20 20 19 20 19 21 18 21 18 22 16 22 16 23 15 23 15 18 14 18 14 17 15 17 15 16 17 16 17 15 18 15 18 14 19 14 19 9 18 9 18 6 16 6 16 7 15 7 15 8 14 8 14 7 10 7 10 8 9 8 9 7 8 7 8 6 6 6 6 9 5 9 5 14 6 14 6 15 7 15 7 16 9 16 9 18 7 18 7 17 6 17 6 16 4 16 4 17 5 17 5 19 6 19 6 20 9 20 9 23 8 23 8 22 6 22 6 21 5 21 5 20 4 20 4 19 3 19 3 17 2 17 2 15 1 15 1 9 2 9 2 7 3 7 3 5 4 5 4 4 5 4 5 3 7 3 7 2 9 2 9 1 15 1 15 2 17 2 17 3 19 3 19 4 20 4 20 5 21 5 21 7 22 7 22 9 23 9"></polygon>
    </svg>
  )
}

export function GitLabIcon() {
  return (
    <svg aria-hidden="true" id="gitlab" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <polygon points="23 8 23 15 22 15 22 16 21 16 21 17 20 17 20 18 18 18 18 19 17 19 17 20 16 20 16 21 14 21 14 22 13 22 13 23 11 23 11 22 10 22 10 21 8 21 8 20 7 20 7 19 6 19 6 18 4 18 4 17 3 17 3 16 2 16 2 15 1 15 1 8 2 8 2 6 3 6 3 3 4 3 4 1 6 1 6 4 7 4 7 7 8 7 8 8 16 8 16 7 17 7 17 4 18 4 18 1 20 1 20 3 21 3 21 6 22 6 22 8 23 8"></polygon>
    </svg>
  )
}
