import React from 'react';
import { PostAdd, History } from '@material-ui/icons'; 
import IntlMessages from '../../../utils/IntlMessages';

export const sidebarNavs = [
  {
    name: <IntlMessages id={'sidebar.main'} />,
    type: 'section',
    children: [
      {
        name: <IntlMessages id={'sidebar.dashboard'} />,
        type: 'item',
        icon: <PostAdd />,
        link: '/dashboard',
      },
      {
        name: <IntlMessages id={'sidebar.history'} />,
        type: 'item',
        icon: <History />,
        link: '/history',
      },
    ],
  },
];

export const horizontalDefaultNavs = [
  {
    name: <IntlMessages id={'sidebar.main'} />,
    type: 'collapse',
    children: [
      {
        name: <IntlMessages id={'sidebar.dashboard'} />,
        type: 'item',
        icon: <PostAdd />,
        link: '/dashboard',
      },
      {
        name: <IntlMessages id={'sidebar.history'} />,
        type: 'item',
        icon: <History />,
        link: '/history',
      },
    ],
  },
];

export const minimalHorizontalMenus = [
  {
    name: <IntlMessages id={'sidebar.main'} />,
    type: 'collapse',
    children: [
      {
        name: <IntlMessages id={'sidebar.dashboard'} />,
        type: 'item',
        icon: <PostAdd />,
        link: '/dashboard',
      },
      {
        name: <IntlMessages id={'sidebar.history'} />,
        type: 'item',
        icon: <History />,
        link: '/history',
      },
    ],
  },
];
