import { PartnersPage } from './app.po';

describe('partners App', function() {
  let page: PartnersPage;

  beforeEach(() => {
    page = new PartnersPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
