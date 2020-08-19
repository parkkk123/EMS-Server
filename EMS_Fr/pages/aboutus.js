import Link from 'next/link'

const AboutUs = () => (
  <div>
    AboutUs Page.
    <Link href={{pathname:'/'}}>
			<a>go back to Home page</a>
		</Link>
  </div>
);

export default AboutUs;
