import React from 'react';
import { PostAdd } from '@material-ui/icons';
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
    ],
  },
];
