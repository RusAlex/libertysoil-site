/*eslint-env node, mocha */
import { TestUtils, expect, React } from '../../test-helpers/expect-unit';
import { Component } from 'react';


class SomeComponent extends Component {
  render() {
    return (<div id={this.props.id}>Some simple content</div>);
  }
}

describe('First test', function() {
  it('should have method render', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<SomeComponent id={125} />);

    return expect(renderer, 'to have rendered',
       <div id={125}>
          Some simple content
       </div>
    );
  });
});
