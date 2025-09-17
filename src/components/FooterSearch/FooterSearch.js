import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import {
  ExternalLink,
  NamedLink,
  IconMap,
  IconList,
} from '../../components';

import css from './FooterSearch.module.css';

const FooterSearch = props => {
  const { rootClassName, className, isMapShow, changeMapSize, handleShowMap, fullMap, showMapMobile } = props;
  const classes = classNames(rootClassName || css.root, className);

  const handleMapAction = (e) => {
    if(!fullMap){
      changeMapSize();
    }
    showMapMobile();
    handleShowMap(!isMapShow);
  }

  const buttonMessage = isMapShow ? <FormattedMessage id="FooterSearch.showList"/> : <FormattedMessage id="FooterSearch.showMap"/>;
  const buttonIcon = isMapShow ? <IconList className={css.iconList}/> : <IconMap className={css.iconMap}/>;

  return (
    <div className={classes}>
      <div className={css.footerContainer}>
        <div className={css.mapActionContainer}>
          <button className={css.mapActionButton} onClick={e => handleMapAction(e)}>
            <span className={css.buttonText}>{buttonMessage}</span>
            <span>{buttonIcon}</span>
          </button>
            {/* egfweghaf wsadgdsf */}
        </div>
      </div>
    </div>
  );
};

export default injectIntl(FooterSearch);
