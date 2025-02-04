import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { ResponsiveImage, Modal, IconButtonDots, IconShareListing, SecondaryButtonInline, SecondaryButton } from '../../components';

import ImageCarousel from './ImageCarousel/ImageCarousel';
import ActionBarMaybe from './ActionBarMaybe';

import css from './ListingPage.module.css';

import {
  LISTING_STATE_CLOSED,
} from '../../util/types';
import classNames from 'classnames';

const SectionHeroBlocks = props => {
  const {
    title,
    titleClassName,
    titleDesktop,
    listing,
    isOwnListing,
    editParams,
    handleViewPhotosClick,
    imageCarouselOpen,
    onImageCarouselClose,
    onManageDisableScrolling,
    noPayoutDetailsSetWithOwnListing,
    handleShareListingClick
  } = props;

  const hasImages = listing.images && listing.images.length > 0;
  const firstImage = hasImages ? listing.images[0] : null;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith('scaled'))
    : [];

  const viewPhotosButton = hasImages ? (
    <button className={css.viewPhotos} onClick={handleViewPhotosClick}>
      <IconButtonDots className={css.viewPhotosDots} />
      <FormattedMessage
        id="ListingPage.viewImagesButton"
        values={{ count: listing.images.length }}
      />
    </button>
  ) : null;

  const isClosed = listing?.attributes?.state === LISTING_STATE_CLOSED;
  const showClosedListingHelpText = listing.id && isClosed;

  const subTitleText = showClosedListingHelpText
    ? intl.formatMessage({ id: 'OrderPanel.subTitleClosedListing' })
    : null;

  const titleClasses = classNames(titleClassName || css.orderTitle);

  const lisitngImages = () => {
    if(listing.images && listing.images.length === 2){
      const image2 = hasImages ? listing.images[1] : null;
      const variants2 = image2
      ? Object.keys(image2?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      return (
        <div className={css.SectionHeroBlocksImages}>
          <div className={css.SectionHeroBlocksLeftImage}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={title}
              image={firstImage}
              variants={variants}
            />
          </div>
          <div className={css.SectionHeroBlocksRightImage}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={title}
              image={image2}
              variants={variants2}
            />
          </div>
        </div>
      )
    }
    else if(listing.images && listing.images.length === 3){
      const image2 = hasImages ? listing.images[1] : null;
      const variants2 = image2
      ? Object.keys(image2?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      const image3 = hasImages ? listing.images[2] : null;
      const variants3 = image3
      ? Object.keys(image3?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      return (
        <div className={css.SectionHeroBlocksImages}>
          <div className={css.SectionHeroBlocksfirsImages}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={title}
              image={firstImage}
              variants={variants}
            />
          </div>
          <div className={css.SectionHeroBlocksSecondImages}>
            <div className={css.SectionHeroBlocksSecondImage}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={title}
                image={image2}
                variants={variants2}
              />
            </div>
            {image3 ? (
              <div className={css.SectionHeroBlocksSecondImage2}>
                <ResponsiveImage
                  rootClassName={css.rootForImage}
                  alt={title}
                  image={image3}
                  variants={variants3}
                />
              </div>
            ): null}
           
          </div>
        </div>
      )
    }else if(listing.images && listing.images.length > 3){
      const image2 = hasImages ? listing.images[1] : null;
      const variants2 = image2
      ? Object.keys(image2?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      const image3 = hasImages ? listing.images[2] : null;
      const variants3 = image3
      ? Object.keys(image3?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      const image4 = hasImages ? listing.images[3] : null;
      const variants4 = image4
      ? Object.keys(image4?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      const image5 = hasImages ? listing.images[4] : null;
      const variants5 = image5
      ? Object.keys(image5?.attributes?.variants).filter(k => k.startsWith('scaled'))
      : [];
      return (
        <div className={css.SectionHeroBlocksImages}>
          <div className={css.SectionHeroBlocksfirsImages}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={title}
              image={firstImage}
              variants={variants}
            />
          </div>
          <div className={css.SectionHeroBlocksSecondImages}>
            <div className={css.SectionHeroBlocksSecondImage}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={title}
                image={image2}
                variants={variants2}
              />
            </div>
            <div className={css.SectionHeroBlocksSecondImage2}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={title}
                image={image3}
                variants={variants3}
              />
            </div>
          </div>
          <div className={css.SectionHeroBlocksSecondImages}>
            <div className={css.SectionHeroBlocksSecondImage}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={title}
                image={image4}
                variants={variants4}
              />
            </div>
            {image5 ? ( 
              <div className={css.SectionHeroBlocksSecondImage2}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={title}
                image={image5}
                variants={variants5}
              />
            </div>
            ) : null}
           
          </div>
        </div>
      )
    } else{
      return (
        <ResponsiveImage
          rootClassName={css.rootForImage}
          alt={title}
          image={firstImage}
          variants={variants}
        />
      )
    }
  }

  return (
    <div className={css.SectionHeroBlocks} data-testid="hero">
      <div className={css.orderHeadingContainer}>
        <div className={css.orderHeading}>
          {titleDesktop ? titleDesktop : <H2 className={titleClasses}>{title}</H2>}
          {subTitleText ? <div className={css.orderHelp}>{subTitleText}</div> : null}
        </div>
          <div onClick={handleShareListingClick}>
            <SecondaryButtonInline className={css.iconShareInline}>
              <IconShareListing className={css.iconShareListing} />
              <FormattedMessage id="ListingPage.share" />
            </SecondaryButtonInline>
          </div>
     
      </div>
      <div className={css.imageWrapperForSectionHero} onClick={handleViewPhotosClick}>
        {listing.id && isOwnListing ? (
          <div onClick={e => e.stopPropagation()} className={css.actionBarContainerForHeroLayout}>
            {noPayoutDetailsSetWithOwnListing ? (
              <ActionBarMaybe
                className={css.actionBarForHeroLayout}
                isOwnListing={isOwnListing}
                listing={listing}
                showNoPayoutDetailsSet={noPayoutDetailsSetWithOwnListing}
              />
            ) : null}

            <ActionBarMaybe
              className={css.actionBarForHeroLayout}
              isOwnListing={isOwnListing}
              listing={listing}
              editParams={editParams}
            />
          </div>
        ) : null}

        <div className={css.SectionHeroBlocksImagesContainer}>
          {lisitngImages()}
        </div>

        {viewPhotosButton}
      </div>
      <Modal
        id="ListingPage.imageCarousel"
        scrollLayerClassName={css.carouselModalScrollLayer}
        containerClassName={css.carouselModalContainer}
        lightCloseButton
        isOpen={imageCarouselOpen}
        onClose={onImageCarouselClose}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <ImageCarousel
          images={listing.images}
          imageVariants={['scaled-small', 'scaled-medium', 'scaled-large', 'scaled-xlarge']}
        />
      </Modal>
    </div>
  );
};

export default SectionHeroBlocks;
