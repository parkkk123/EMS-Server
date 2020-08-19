const layoutStyle = {
  border: '0px solid #DDD'
}
const Layout = (props) => (
  <div style={layoutStyle}>
    {props.children}
  </div>
)
export default Layout