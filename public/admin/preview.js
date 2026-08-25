const cssText = `
body {
  font-family: Inter, 'IBM Plex Sans', 'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #cfcbcb;
  background-color: #111111;
  color-scheme: dark;
}

.container {
    border: 1px solid rgba(207, 203, 203, 0.12);
    padding: 1rem;
}

.squareImage {
  aspect-ratio: 1 / 1;
  max-width: 24rem;
  object-fit: cover;
  width: 100%;
}

.verticalImage {
  aspect-ratio: 4 / 5;
  max-width: 24rem;
  object-fit: cover;
  width: 100%;
}

.horizontalImage {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.eyebrow {
  color: #c71d1b;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.authors {
  font-weight: normal;
  color: #828282;
}

.socials {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.socials a {
  color: #cfcbcb;
  border: 1px solid rgba(207, 203, 203, 0.16);
  padding: 0.7rem 1rem;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
}

.socials a.socialIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  padding: 0;
  border-radius: 999px;
}

.socials a.socialIcon svg {
  display: block;
}

.info-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
}

.secondaryLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.2rem;
  border: 1px solid #c71d1b;
  color: #cfcbcb;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
}

.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(207, 203, 203, 0.12);
  padding: 1rem;
}

.title {
  color: #c71d1b;
  font-size: 3rem;
  margin-bottom: 2rem;
}

.subtitle {
  max-width: 620px;
  color: rgba(207, 203, 203, 0.78);
  margin: 1rem 0 1.5rem;
  font-size: 1.5rem;
  text-align: center;
  border: 2px dashed #555;
  border-radius: 0 3rem 0 3rem;
  padding: 3rem;
}
`;

CMS.registerPreviewStyle(cssText, { raw: true });

function CalendarIcon(props) {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props
    },
    h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }),
    h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
    h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
    h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })
  );
}

function MapPinIcon(props) {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props
    },
    h('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
    h('circle', { cx: 12, cy: 10, r: 3 })
  );
}

function MailIcon(props) {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props
    },
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' })
  );
}

function PhoneIcon(props) {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props
    },
    h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
  );
}

function getImageUrl(asset) {
  if (!asset) return '';
  return asset.toString();
}

var SOCIAL_ICON_PATH = {
  vk: 'M31.4907 63.4907C0 94.9813 0 145.671 0 247.04V264.96C0 366.329 0 417.019 31.4907 448.509C62.9813 480 113.671 480 215.04 480H232.96C334.329 480 385.019 480 416.509 448.509C448 417.019 448 366.329 448 264.96V247.04C448 145.671 448 94.9813 416.509 63.4907C385.019 32 334.329 32 232.96 32H215.04C113.671 32 62.9813 32 31.4907 63.4907ZM75.6 168.267H126.747C128.427 253.76 166.133 289.973 196 297.44V168.267H244.16V242C273.653 238.827 304.64 205.227 315.093 168.267H363.253C359.313 187.435 351.46 205.583 340.186 221.579C328.913 237.574 314.461 251.071 297.733 261.227C316.41 270.499 332.907 283.63 346.132 299.751C359.357 315.873 369.01 334.618 374.453 354.747H321.44C316.555 337.262 306.614 321.61 292.865 309.754C279.117 297.899 262.173 290.368 244.16 288.107V354.747H238.373C136.267 354.747 78.0267 284.747 75.6 168.267Z',
  telegram: 'M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z',
  instagram: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
  x: 'M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z',
  facebook: 'M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z'
};

function renderSocialLink(s) {
  var url = s.get('url');
  var label = s.get('label') || '';
  var type = s.get('type');
  var d = SOCIAL_ICON_PATH[type];
  if (d) {
    return h('a', { href: url, className: 'socialIcon', title: label },
      h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 448 512', width: 18, height: 18, fill: 'currentColor' },
        h('path', { d: d })));
  }
  if (type === 'custom') {
    return h('a', { href: url, className: 'socialIcon', title: label },
      h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
        h('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })));
  }
  return h('a', { href: url }, label);
}

var ArtistPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var data = entry.get('data');
    var nickname = data.get('nickname') || '';
    var biography = data.get('biography') || '';
    var verticalImage = this.props.getAsset(data.get('verticalImage'));
    var squareImage = this.props.getAsset(data.get('squareImage'));
    var socials = data.get('socials') || [];

    return h('div', { className: 'container' },
      squareImage ? h('img', { className: 'squareImage', src: getImageUrl(squareImage), alt: nickname }) : null,
      verticalImage ? h('img', { className: 'verticalImage', src: getImageUrl(verticalImage), alt: nickname }) : null,
      h('p', { className: 'eyebrow' }, 'Профиль артиста'),
      h('h1', {}, nickname),
      h('p', {}, biography),
      socials.size > 0 ? h('div', { className: 'socials' }, socials.map(function (s) {
        return renderSocialLink(s);
      })) : null
    );
  }
});

var TrackPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var data = entry.get('data');
    var title = data.get('title') || '';
    var cover = this.props.getAsset(data.get('cover'));
    var description = data.get('description') || '';
    var releaseDate = data.get('releaseDate') || '';

    function formatDate(dateString) {
      if (!dateString) return 'Дата не указана';
      var date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      var day = String(date.getDate()).padStart(2, '0');
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var year = date.getFullYear();
      return day + '.' + month + '.' + year;
    }

    return h('div', { className: 'container' },
      cover ? h('img', { className: 'squareImage', src: getImageUrl(cover), alt: title }) : null,
      h('p', { className: 'eyebrow' }, 'Новый релиз'),
      h('h1', {}, title),
      h('h3', {}, 'Дата релиза: ' + formatDate(releaseDate)),
      h('p', {}, description),
      h('a', { className: 'secondaryLink' }, 'Слушать')
    );
  }
});
var AlbumPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var data = entry.get('data');
    var title = data.get('title') || '';
    var cover = this.props.getAsset(data.get('cover'));
    var description = data.get('description') || '';
    var releaseDate = data.get('releaseDate') || '';
    var tracks = data.get('tracks') || [];

    function formatDate(dateString) {
      if (!dateString) return 'Дата не указана';
      var date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      var day = String(date.getDate()).padStart(2, '0');
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var year = date.getFullYear();
      return day + '.' + month + '.' + year;
    }

    return h('div', { className: 'container' },
      cover ? h('img', { className: 'squareImage', src: getImageUrl(cover), alt: title }) : null,
      h('p', { className: 'eyebrow' }, 'Альбом'),
      h('h1', {}, title),
      h('h3', {}, 'Дата релиза: ' + formatDate(releaseDate)),
      h('p', {}, description),
      (tracks && tracks.size > 0)
        ? h('h4', {}, 'Треки: ' + tracks.map(function (t) {
            if (!t) return '';
            return (typeof t.get === 'function') ? (t.get('title') || '') : (t.title || t || '');
          }).join(', '))
        : null
    );
  }
});

var EventPreview = createClass({
  render: function () {
    var { FiCalendar, FiMapPin } = window;

    var entry = this.props.entry;
    var data = entry.get('data');
    var title = data.get('title') || '';
    var description = data.get('description') || '';
    var image = this.props.getAsset(data.get('image'));
    var date = data.get('date') || '';
    var location = data.get('location') || '';
    var links = data.get('links') || [];

    function formatDate(dateString) {
      if (!dateString) return 'Дата не указана';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return h('div', { className: 'container' },
      image ? h('img', { className: 'horizontalImage', src: getImageUrl(image), alt: title }) : null,
      h('p', { className: 'eyebrow' }, 'Мероприятие'),
      h('h1', {}, title),
      h('p', {}, description),
      h('div', { className: 'info-line' },
        h(CalendarIcon, { style: { marginRight: '8px' } }),
        formatDate(date)
      ),
      h('div', { className: 'info-line' },
        h(MapPinIcon, { style: { marginRight: '8px' } }),
        location || 'Место не указано'
      ),
      links.size > 0 ? h('div', { className: 'socials' }, links.map(function (s) {
        return h('a', { href: s.get('url') }, s.get('label'));
      })) : null
    );
  }
});

var ServicePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var data = entry.get('data');
    var title = data.get('title') || '';
    var description = data.get('description') || '';
    var shortDescription = data.get('shortDescription') || '';
    var image = this.props.getAsset(data.get('image'));

    return h('div', { className: 'container' },
      image ? h('img', { className: 'squareImage', src: getImageUrl(image), alt: title }) : null,
      h('p', { className: 'eyebrow' }, 'Услуга'),
      h('h1', {}, title),
      h('p', {}, shortDescription || description)
    );
  }
});

var HomepagePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var data = entry.get('data');
    var heroTitle = data.get('heroTitle') || '';
    var heroSubtitle = data.get('heroSubtitle') || '';
    var featuredAlbums = data.get('featuredAlbums') || [];
    var featuredTracks = data.get('featuredTracks') || [];

    function releaseLabel(item) {
      if (!item) return '';
      if (typeof item.get === 'function') return item.get('title') || item.get('id') || '';
      if (typeof item === 'object') return item.title || item.id || '';
      return String(item);
    }

    function listLabel(list) {
      if (!list || list.size === 0) return 'не выбраны';
      return list.map(function (item) {
        return releaseLabel(item);
      }).filter(function (label) {
        return label;
      }).join(', ');
    }

    return h('div', { className: 'homepage' },
      h('h1', { className: 'title' }, heroTitle),
      h('p', { className: 'subtitle' },
        '«', h('span', { style: { color: '#c71d1b' } }, 'Край'),
        h('span', { style: { color: '#fff' } }, 'Music'),
        '»', heroSubtitle
      ),
      h('h3', {}, 'Недавние релизы'),
      h('h4', {}, 'Альбомы: ' + listLabel(featuredAlbums)),
      h('h4', {}, 'Треки: ' + listLabel(featuredTracks))
    );
  }
});

var ContactsPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var data = entry.get('data');
    var email = data.get('email') || '';
    var phone = data.get('phone') || '';
    var address = data.get('address') || '';
    var socials = data.get('socials') || [];

    var lineStyle = { display: 'flex', alignItems: 'center', margin: '0.5rem 0' };
    var iconStyle = { marginRight: '8px', flexShrink: 0 };

    return h('div', { className: 'previewContainer' },
      h('div', { className: 'card' },
        h('h3', {}, 'Контакты'),
        h('div', { style: lineStyle },
          h(MailIcon, { style: iconStyle }),
          email
        ),
        h('div', { style: lineStyle },
          h(PhoneIcon, { style: iconStyle }),
          phone
        ),
        h('div', { style: lineStyle },
          h(MapPinIcon, { style: iconStyle }),
          address || 'Адрес не указан'
        ),
        socials.size > 0 ? h('div', { className: 'socials' }, socials.map(function (s) {
          return renderSocialLink(s);
        })) : null
      )
    );
  }
});

CMS.registerPreviewTemplate('artists', ArtistPreview);
CMS.registerPreviewTemplate('tracks', TrackPreview);
CMS.registerPreviewTemplate('albums', AlbumPreview);
CMS.registerPreviewTemplate('events', EventPreview);
CMS.registerPreviewTemplate('services', ServicePreview);

CMS.registerPreviewTemplate('homepage', HomepagePreview);
CMS.registerPreviewTemplate('contacts', ContactsPreview);