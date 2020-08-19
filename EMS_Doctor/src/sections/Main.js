import React from 'react'

import Link from 'next/link'

class Main extends React.Component {
    render() {
        return <div >
        Welcome to Next.js
        <Link href={ {pathname:'/profile/1',query:{test:1}}}>
        <a>go to Profile of user id = 1</a>
        </Link>
        <br/>
        <img style={{width:100}} src='/static/img/example.png'/>
    </div>
    }
}

export default Main