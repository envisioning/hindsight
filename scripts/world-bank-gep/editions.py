"""GEP editions covered by the World Bank "gdp-growth" table files.
file stem -> (edition id, published, how the month was established)."""
ANNUAL = {  # annual editions, titled by the first forecast year
    'GEP-2000': ('1999-12', 'World Bank Documents & Reports catalog date 1999-12-31'),
    'GEP-2001': ('2000-12', 'World Bank Documents & Reports catalog date 2000-12-31'),
    'GEP-2002': ('2002-01', 'World Bank Documents & Reports catalog date 2002-01-01'),
    'GEP-2003': ('2003-01', 'World Bank Documents & Reports catalog date 2003-01-31'),
    'GEP-2004': ('2003-09', 'World Bank Documents & Reports catalog date 2003-09-01'),
    'GEP-2005': ('2004-11', 'World Bank Documents & Reports catalog date 2004-11-01'),
    'GEP-2006': ('2005-11', 'World Bank Documents & Reports catalog date 2005-11-01'),
    'GEP-2007': ('2006-12', 'World Bank press release of the report, December 2006'),
    'GEP-2008': ('2008-01', 'World Bank press release of the report, January 2008'),
    'GEP-2009': ('2008-12', 'World Bank press release of the report, December 2008'),
}
MONTHS = {'January': '01', 'Jan': '01', 'June': '06', 'Jun': '06'}

def edition(stem):
    """stem like GEP-June-2014-gdp-growth -> (edition id, published, month source, title)"""
    s = stem.replace('-gdp-growth', '')
    if s in ANNUAL:
        e, how = ANNUAL[s]
        return e, e, how, 'Global Economic Prospects %s' % s[4:]
    _, m, y = s.split('-')
    e = '%s-%s' % (y, MONTHS[m])
    return e, e, 'edition title', 'Global Economic Prospects, %s %s' % ({'Jan': 'January', 'Jun': 'June'}.get(m, m), y)
