import React, { useState,useCallback } from 'react';
import PropTypes from 'prop-types';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { useStaticQuery, graphql } from 'gatsby';
import '../utils/css/components/lightbox.css';

const LightboxImage = (props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, {photo, index}) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  const { images, direction, columns } = props;
  // TODO: find a better way to query for both the large and small image
  const data = useStaticQuery(graphql`
    query LightboxImageQuery {
      allFile(filter: {
        extension: {
          regex: "/jpeg|jpg|png/"
        }
      }) {
        edges {
          node {
            childImageSharp {
              fluid {
                src
                srcSet
                presentationHeight
                presentationWidth
                originalName
              }
            }
          }
        }
      }
    }
  `)

  const photos = data.allFile.edges.map((photo) => {
    const {
      src,
      srcSet,
      presentationHeight,
      presentationWidth,
      originalName,
    } = photo.node.childImageSharp.fluid;
    return {
      src,
      srcSet,
      width: presentationWidth,
      height: presentationHeight,
      title: originalName,
    };
  });
  const filteredPhotos = images.map((image) => {
    const photo = photos.find((p) => p.title === image.title);
    return {
      ...photo,
      caption: image.caption ? image.caption : photo.title,
    };
  });

  return (
    <div>
      <Gallery direction={direction} columns={columns} className="lightbox-gallery" photos={filteredPhotos}  onClick = {openLightbox} />
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal allowFullscreen={false} preventScroll={false} onClose ={closeLightbox}>
            <Carousel
              currentIndex = {currentImage}
              views = {filteredPhotos.map(x => ({
                ...x,
                srcset: x.srcSet,
                caption: x.caption,
              }))}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  );
};

LightboxImage.defaultProps = {
  images: {},
};

LightboxImage.propTypes = {
  images: PropTypes.array
}

export default LightboxImage;