// src/scripts/routes/routes.js
import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/story/add-story-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import AboutPage from '../pages/about/about-page';

const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add-story': AddStoryPage,
  '/story/:id': StoryDetailPage,
  '/about': AboutPage,
};

export default routes;
