import React from "react";
import { useSelector } from "react-redux";
import { selectData } from "../pages/homeSlice";
import styled from "styled-components";
// Data
import { linkedin_link, linkedin_icon, twitter_link, twitter_icon } from "../data";
// Icons
import { Icon } from '@iconify/react';

const StyledSocialLinks = styled.div`
  a {
    margin: 0 1rem;
  }
`;

export default function SocialLinks() {
  const { html_url } = useSelector(selectData);

  return (
    <StyledSocialLinks>
      <a
        href={html_url}
        aria-label="Check out my GitHub profile."
        className="link-icons"
      >
        <Icon icon="icomoon-free:github" />
      </a>
      {linkedin_icon && (
        <a href={linkedin_link} aria-label="External link" className="link-icons">
          {linkedin_icon}
        </a>
      )}
        {twitter_icon && (
        <a href={twitter_link} aria-label="External link" className="link-icons">
          {twitter_icon}
        </a>
      )}
    </StyledSocialLinks>
  );
}
