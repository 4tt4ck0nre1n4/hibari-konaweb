if (import.meta.env["PUBLIC_API_URL"] === undefined) {
  throw new Error("Please set environment variables: PUBLIC_API_URL");
}

export const headlessCmsUrl = import.meta.env["PUBLIC_API_URL"] as string;

export const headlessCmsApiPrefix = import.meta.env.PUBLIC_API_PREFIX as string;

export const worksPageApi = "works?context=embed&acf_format=standard&per_page=20";
export const worksSlugApi = "works?context=embed&acf_format=standard&slug=";
export const worksPathApi = "works?context=embed&acf_format=standard";
export const WORKS_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksPageApi}`;
export const WORKS_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksSlugApi}`;
export const WORKS_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${worksPathApi}`;

export const wpcf7ApiPrefix = import.meta.env.PUBLIC_WPCF7_API_PREFIX as string;
export const wpcf7ApiId = import.meta.env.PUBLIC_WPCF7_API_ID as string;
export const CONTACT_WPCF7_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${wpcf7ApiPrefix}${wpcf7ApiId}`;
export const wpcf7Id = import.meta.env.PUBLIC_WPCF7_ID as string;
export const wpcf7UnitTag = import.meta.env["PUBLIC_WPCF7_UNIT_TAG"] as string;
export const wpcf7PostId = import.meta.env["PUBLIC_WPCF7_POST_ID"] as string;

export const blogPageApi = "posts?_embed&context=embed&acf_format=standard&per_page=100";
export const blogPostApi = "posts?context=embed&acf_format=standard";
export const blogSlugApi = "posts?context=embed&acf_format=standard&slug=";

export const categoryPageApi = "categories?context=embed&acf_format=standard&per_page=100";
export const categorySlugApi = "categories?context=embed&acf_format=standard&slug=";
export const categoryIdApi = "posts?categories=";

export const BLOG_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${blogPageApi}`;
export const BLOG_POST_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${blogPostApi}`;
export const BLOG_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${blogSlugApi}`;
export const CATEGORY_PAGE_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${categoryPageApi}`;
export const CATEGORY_SLUG_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${categorySlugApi}`;
export const CATEGORY_ID_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${categoryIdApi}`;

export const sliderPathApi = "sliders?context=embed&acf_format=standard";
export const SLIDER_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${sliderPathApi}`;

export const swiperPathApi = "swiper?context=embed&acf_format=standard&cache_bust=";
export const SWIPER_PATH_API = `${headlessCmsUrl}${headlessCmsApiPrefix}${swiperPathApi}`;
