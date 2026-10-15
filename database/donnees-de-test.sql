-- Données FICTIVES pour développer sans dépendre des autres pages (jamais en production).
-- Mot de passe de tous les participants de test : test1234   |   admin de test : admin1234
-- À importer APRÈS site_de_parrainage.sql, dans la même base.

INSERT INTO `administrateur` (`telephone`, `mot_de_passe`) VALUES
('770000000', '$2y$12$Zt9S8qnmG.0tFsFS0H5pWe6VTw5FRH4VUb1mPprPO.4KuwNPhij6q');

INSERT INTO `participant` (`telephone`, `nom`, `prenom`, `sous_departement`, `role`, `mot_de_passe`, `photo`, `accepte_plusieurs`) VALUES
('771000001', 'Diop',   'Awa',      'INF', 'marraine', '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('771000002', 'Sow',    'Ibrahima', 'INF', 'parrain',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('771000003', 'Ndiaye', 'Coumba',   'INF', 'marraine', '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 0),
('772000001', 'Gueye',  'Fatou',    'TR',  'marraine', '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('772000002', 'Diallo', 'Mamadou',  'TR',  'parrain',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('773000001', 'Ndiaye', 'Moussa',   'INF', 'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('773000002', 'Fall',   'Aminata',  'INF', 'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('773000003', 'Ba',     'Khady',    'INF', 'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('773000004', 'Sarr',   'Cheikh',   'INF', 'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('774000001', 'Thiam',  'Bineta',   'TR',  'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('774000002', 'Kane',   'Omar',     'TR',  'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1),
('774000003', 'Cisse',  'Mariama',  'TR',  'filleul',  '$2y$12$DJ8t4nDNSSQ.8y5WIRWFOOOI6LZVdpbmHTEPU0SYukdaoxeCfA8g6', 'uploads/defaut.svg', 1);

-- Une demande de mot de passe oublié pour tester gestion-mots-de-passe
INSERT INTO `demande_mot_de_passe` (`telephone`) VALUES ('773000001');
