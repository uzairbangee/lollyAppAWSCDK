import React from 'react'
import Header from "./Header"

interface Props {
    
}

const Layout = ({children}) => {
    return (
        <div className="container">
            <Header />
            {children}
        </div>
    )
}

export default Layout
