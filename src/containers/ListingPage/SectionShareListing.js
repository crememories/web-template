import React, { useState } from 'react';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, FacebookMessengerShareButton } from "react-share";

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FormattedMessage } from '../../util/reactIntl';
import { 
  ResponsiveImage, 
  Modal, 
  H4, 
  SecondaryButton, 
  IconCopy,
  IconEmail,
  IconMessages,
  IconWhatsApp,
  IconMessenger,
  IconFacebook,
  IconTwitter,
  IconMoreOptions,
} from '../../components';

import classNames from 'classnames';

import css from './ListingPage.module.css';
import bottonCss from '../../components/Button/Button.module.css';

const SectionShareListing = props => {
  const {
    listing,
    shareListingOpen,
    onshareListingClose,
    onManageDisableScrolling,
    handleShareListingCopied,
    shareListingCopied,
    intl,
    richTitle
  } = props;

  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = () => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100); // Adjust the delay as needed

    handleShareListingCopied(true);
    setTimeout(() => {
      handleShareListingCopied(false);
      setIsVisible(false);
    }, 1500); // Reset status after 1.5 seconds
  };

  const hasImages = listing.images && listing.images.length > 0;
  const firstImage = hasImages ? listing.images[0] : null;
  const variants = firstImage
  ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith('scaled'))
  : [];
  const altImage = intl.formatMessage(
    { id: 'ListingImageGallery.imageAltText' }
  );

  // console.log(listing);

  // const shareTitle = listing.

  function shareByEmail() {
    const subject = "";
    const body = location.href;
  
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
    window.location.href = mailtoLink;
  }

  function shareBySMS() {
    const body = location.href;
    const smsLink = `sms:?body=${encodeURIComponent(body)}`;
  
    window.location.href = smsLink;
  }

  function shareByNavigator() {
    const link = location.href;
    const shareData = {
      title: <FormattedMessage id="ListingPage.shareListingTitle" />,
      url: link,
    };
    navigator.share(shareData)
    // const smsLink = `sms:?body=${encodeURIComponent(body)}`;
  
    // window.location.href = smsLink;
  }

  const shareLink = location.href;

  const copyToClipboardClass = isVisible ? classNames(
    css.copyToClipboardMessage,
    css.copyToClipboardMessageShow
  ) : css.copyToClipboardMessage;

  const copyMessage = shareListingCopied ? (
    <div className={css.copyToClipboardMessageContainer}>
      <div className={copyToClipboardClass}>
        Link copied
      </div>
    </div>
  ) : null;

  return (
    <div className={css.SectionShareListing} data-testid="hero">
      <Modal
        id="ListingPage.shareListing"
        // scrollLayerClassName={css.carouselModalScrollLayer}
        // containerClassName={css.shareListingModalContainer}
        // lightCloseButton
        isOpen={shareListingOpen}
        onClose={onshareListingClose}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <H4 as="h1" className={css.orderPanelTitle}>
          <FormattedMessage id="ListingPage.shareListingTitle" />
        </H4>

        <div className={css.sharePreviewContainer}>
          <div className={css.sharePreviewImage}>
            <ResponsiveImage
              rootClassName={css.thumb}
              image={firstImage}
              alt={altImage}
              variants={variants}
              sizes="88px"
            />
          </div>
          <div className={css.sharePreviewTitle}>
            <FormattedMessage id="ListingPage.orderTitle" values={{ title: richTitle }} />
          </div>
        </div>

        <div className={css.shareListingButtons}>
          <div>
            <CopyToClipboard text={shareLink} onCopy={handleCopy}>
              <SecondaryButton className={css.shareBtn}
                // onClick={onClickContactUser}
                enforcePagePreloadFor="SignupPage"
              >
                <IconCopy className={css.shareIcon} />
                <FormattedMessage id="ListingPage.shareByCopy" />
              </SecondaryButton>
            </CopyToClipboard>
          </div>
          <div>
            <SecondaryButton className={css.shareBtn}
              onClick={shareByEmail}
              // enforcePagePreloadFor="SignupPage"
            >
               <IconEmail className={css.shareIcon} />
              <FormattedMessage id="ListingPage.shareByEmail" />
            </SecondaryButton>
          </div>
          <div>
            <SecondaryButton className={css.shareBtn}
              onClick={shareBySMS}
              // enforcePagePreloadFor="SignupPage"
            >
              <IconMessages className={css.shareIcon} />
              <FormattedMessage id="ListingPage.shareByMessage" />
            </SecondaryButton>
          </div>
          <div>
            <WhatsappShareButton className={css.shareBtn}
              url={shareLink}
              quote={'Title or jo bhi aapko likhna ho'}
            >
              <div className={classNames(css.shareBtnComponent, css.shareBtn, bottonCss.secondaryButtonRoot, bottonCss.secondaryButton, 'buttonSecondary')}>
                <IconWhatsApp className={css.shareIcon} />
                <FormattedMessage id="ListingPage.shareByWhatsApp" />
              </div>
            </WhatsappShareButton>
          </div>  
          <div>
            <FacebookMessengerShareButton className={css.shareBtn}
              url={shareLink}
            >
              <div className={classNames(css.shareBtnComponent, css.shareBtn, bottonCss.secondaryButtonRoot, bottonCss.secondaryButton, 'buttonSecondary')}>
                <IconMessenger className={css.shareIcon} />
                <FormattedMessage id="ListingPage.shareByMessenger" />
              </div>
            </FacebookMessengerShareButton>
          </div>
          <div>
            <FacebookShareButton className={css.shareBtn}
              url={shareLink}
            >
              <div className={classNames(css.shareBtnComponent, css.shareBtn, bottonCss.secondaryButtonRoot, bottonCss.secondaryButton, 'buttonSecondary')}>
                <IconFacebook className={css.shareIcon} />
                <FormattedMessage id="ListingPage.shareByFacebook" />
              </div>
            </FacebookShareButton>
          </div>
          <div>
            <TwitterShareButton className={css.shareBtn}
              url={shareLink}
            >
              <div className={classNames(css.shareBtnComponent, css.shareBtn, bottonCss.secondaryButtonRoot, bottonCss.secondaryButton, 'buttonSecondary')}>
                <IconTwitter className={css.shareIcon} />
                <FormattedMessage id="ListingPage.shareByTwitter" />
              </div>
            </TwitterShareButton>
          </div>
          <div>
            <SecondaryButton className={css.shareBtn}
              onClick={shareByNavigator}
              // enforcePagePreloadFor="SignupPage"
            >
              <IconMoreOptions className={css.shareIconMore} />
              <FormattedMessage id="ListingPage.shareMoreOptions" />
            </SecondaryButton>
          </div>
        </div>
      
        {/* <ImageCarousel
          images={listing.images}
          imageVariants={['scaled-small', 'scaled-medium', 'scaled-large', 'scaled-xlarge']}
        /> */}
       {copyMessage}
      </Modal>
    </div>
  );
};

export default SectionShareListing;
