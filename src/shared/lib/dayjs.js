// The app's single dayjs setup: plugins and the locales the UI ships in. Import dayjs from here.
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/nl';
import 'dayjs/locale/pt';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export default dayjs;
