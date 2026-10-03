import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { e: null }; static getDerivedStateFromError(e) { return { e }; }
  render() { return this.state.e ? <div className="center"><div className="card"><h3>Something went wrong</h3><p>Reload the page. If it keeps happening, log out and back in.</p><button onClick={() => location.reload()}>Reload</button></div></div> : this.props.children; }
}
