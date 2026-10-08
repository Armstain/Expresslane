import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";

const PageHeader = ({ title, description, actions, children }) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
    <Helmet>
      <title>{`${title} | ExpressLane`}</title>
    </Helmet>
    <div className="space-y-1">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default PageHeader;
