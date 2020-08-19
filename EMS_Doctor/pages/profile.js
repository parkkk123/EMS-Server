import Link from 'next/link'

class Profile extends React.Component {
  static async getInitialProps({req}) {
    return {...req.params,...req.query};
  }
 
  render(){
    console.log(this.props)
    return (
      <div>
        <Link href={{pathname:'/'}}>
          <a>go back to Home page</a>
        </Link>
      </div>
    )
  }
}

export default Profile;
