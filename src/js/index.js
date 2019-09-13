import 'svgxuse';
import objectFitImages from 'object-fit-images';

import '../style/stylesheet.scss';

$(document).ready(function() {
  objectFitImages(null, { watchMQ: true });
});
