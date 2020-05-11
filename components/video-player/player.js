import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import styled from 'styled-components';

import playerCss from './player-css';

const HLS_EXTENSION = /\.(m3u8)($|\?)/i;
const DASH_EXTENSION = /\.(mpd)($|\?)/i;
const MOV_EXTENSION = /\.(mov)($|\?)/i;

function getVideoType(url) {
  if (HLS_EXTENSION.test(url)) {
    return 'application/x-mpegURL';
  } else if (DASH_EXTENSION.test(url)) {
    return 'application/dash+xml';
  } else if (MOV_EXTENSION.test(url)) {
    return 'video/mp4';
  } else {
    return `video/mp4`;
  }
}
const playSize = 100;

const Outer = styled.div`
  ${playerCss}

  .video-js {
    height: 100% !important;
    position: absolute;
    z-index: 0;

    video:not(.vjs-has-started) {
      cursor: pointer;
    }

    button.vjs-big-play-button {
      opacity: 0;
    }
  }
`;

const Overlay = styled.div`
  background: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${playSize}px;
    height: ${playSize}px;
    margin: -${playSize / 2}px 0 0 -${playSize / 2}px;
    border: none;
    background: url('/static/play.svg') no-repeat center center;
    background-size: contain;
    background-color: transparent !important;
  }

  .vjs-has-started + & {
    display: none;
  }
`;

export default function VideoPlayer({
  playlists,
  autoplay = false,
  controls = true,
  fluid = true,
  ...rest
}) {
  const ref = useRef();

  const sources =
    playlists
      ?.map(playlist => ({
        type: getVideoType(playlist),
        src: playlist
      }))
      .sort(s => (HLS_EXTENSION.test(s.src) ? -1 : 1)) || [];

  useEffect(() => {
    if (ref.current) {
      // const outer = document.createElement('div');
      // outer.setAttribute('data-vjs-player', true);
      const videoElement = document.createElement('video');
      videoElement.classList.add('video-js');
      // outer.appendChild(videoElement);
      ref.current.insertBefore(videoElement, ref.current.children[0]);

      const player = videojs(videoElement, {
        sources,
        autoplay,
        controls,
        fluid
      });

      return () => player.dispose();
    }
  }, [sources, autoplay, controls, fluid]);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Outer {...rest} ref={ref}>
      <Overlay />
    </Outer>
  );
}
