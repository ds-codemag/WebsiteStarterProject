import '../style/stylesheet.scss';

function component() {
  let element = document.createElement('p');

  element.innerText = 'Website Starter Project';

  return element;
}

document.body.appendChild(component());
