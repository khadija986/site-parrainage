-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 07 oct. 2026 à 19:36
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `site_de_parrainage`
--

-- --------------------------------------------------------

--
-- Structure de la table `association`
--

CREATE TABLE `association` (
  `telephone_filleul` varchar(20) NOT NULL,
  `telephone_parrain` varchar(20) NOT NULL,
  `date_tirage` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `administrateur`
--

CREATE TABLE `administrateur` (
  `telephone` varchar(20) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `demande_mot_de_passe`
--

CREATE TABLE `demande_mot_de_passe` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telephone` varchar(20) NOT NULL,
  `date_demande` timestamp NOT NULL DEFAULT current_timestamp(),
  `traitee` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_demande_participant` (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `participant`
--

CREATE TABLE `participant` (
  `telephone` varchar(20) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `sous_departement` enum('INF','TR') NOT NULL,
  `role` enum('parrain','marraine','filleul') NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `mot_de_passe_temporaire` tinyint(1) NOT NULL DEFAULT 0,
  `accepte_plusieurs` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `association`
--
ALTER TABLE `association`
  ADD PRIMARY KEY (`telephone_filleul`),
  ADD KEY `fk_parrain` (`telephone_parrain`);

--
-- Index pour la table `administrateur`
--
ALTER TABLE `administrateur`
  ADD PRIMARY KEY (`telephone`);

--
-- Index pour la table `participant`
--
ALTER TABLE `participant`
  ADD UNIQUE KEY `telephone` (`telephone`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `association`
--
ALTER TABLE `association`
  ADD CONSTRAINT `fk_filleul` FOREIGN KEY (`telephone_filleul`) REFERENCES `participant` (`telephone`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_parrain` FOREIGN KEY (`telephone_parrain`) REFERENCES `participant` (`telephone`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `demande_mot_de_passe`
--
ALTER TABLE `demande_mot_de_passe`
  ADD CONSTRAINT `fk_demande_participant` FOREIGN KEY (`telephone`) REFERENCES `participant` (`telephone`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
