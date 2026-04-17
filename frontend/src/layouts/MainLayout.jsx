import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

function MainLayout({ children, pageTitle, breadcrumb }) {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar pageTitle={pageTitle} breadcrumb={breadcrumb} />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
