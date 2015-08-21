import React from 'react'

export default class RegisterComponent extends React.Component {

  async submitHandler(event) {

    event.preventDefault();

    let form = event.target;

    if(true || form.password.value != '' && form.password.value === form.password_repeat.value) {
      const host = 'http://localhost:8000';

      let data = new FormData(form);
      data.append('user', 'hubot');

      //console.log(data.getAll());

      let result = await fetch(`${host}/api/v1/users`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Hubot',
          login: 'hubot',
        })

      });



    } else {
      //Error
      console.log('error');
    }


    //this.setState({message: event.target.value});
  };

  render() {
    return (
      <div className="page__body">
        <div className="area">
          <div className="area__body layout-align_start">
            <div className="box box-middle">
              <header className="box__title">Login</header>
              <div className="box__body">
                <div className="layout__row">
                  <div className="form__row">
                    <label className="label label-block">Email</label>
                    <input className="input" type="text"/>
                  </div>
                  <div className="form__row">
                    <label className="label label-block">Password</label>
                    <input className="input" type="password"/>
                  </div>
                </div>
                <div className="layout__row layout layout-align_vertical layout-align_justify">
                  <a href="#" className="link">Password reminder</a>
                  <button className="button button-green">Login</button>
                </div>
              </div>
            </div>
            <div className="box box-middle">
              <header className="box__title">Register</header>
              <form action="" onSubmit={this.submitHandler}>
                <div className="box__body">
                  <div className="layout__row">
                    <div className="form__row">
                      <label className="label label-block">First name</label>
                      <input className="input" type="text" name="username"/>
                    </div>
                    <div className="form__row">
                      <label className="label label-block">Last name</label>
                      <input className="input" type="text"/>
                    </div>
                    <div className="form__row">
                      <label className="label label-block">Email</label>
                      <input className="input" type="email" name="email"/>
                    </div>
                    <div className="form__row">
                      <label className="label label-block">Password</label>
                      <input className="input" type="password" name="password"/>
                    </div>
                    <div className="form__row">
                      <label className="label label-block">Repeat password</label>
                      <input className="input" type="password" name="password_repeat"/>
                    </div>
                  </div>
                  <div className="layout__row layout layout-align_vertical layout-align_justify">
                    <button className="button button-yellow">Send</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
