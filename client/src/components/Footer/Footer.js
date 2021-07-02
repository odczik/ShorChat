import React from "react"

import "./Footer.css"

const Footer = () => (
    <div className="has-background-light has-text-black bottom myFooter">
    <div className="container is-fluid">
      <div className="columns">
        <div className="column">
            <p>© Copyright | odczik</p>
        </div>
        <div className="column has-text-right">
            <a className="copyrighted-badge" title="Copyrighted.com Registered &amp; Protected" target="_blank" rel="noopener noreferrer" href="https://www.copyrighted.com/website/OeNVDjOLOKRF3F2f"><img alt="Copyrighted.com Registered &amp; Protected" border="0" width="125" height="25" srcSet="https://static.copyrighted.com/badges/125x25/01_2_2x.png 2x" src="https://static.copyrighted.com/badges/125x25/01_2.png" /></a>
        </div>
      </div>
    </div>
  </div>
)

export default Footer